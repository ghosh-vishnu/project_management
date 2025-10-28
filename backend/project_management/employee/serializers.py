from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Department, Designation, Address, BankDetails, Documents, Employee


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = '__all__'


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'


class BankDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankDetails
        fields = '__all__'


class DocumentsSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()
    resume = serializers.SerializerMethodField()
    aadhar_card = serializers.SerializerMethodField()
    pan_card = serializers.SerializerMethodField()
    higher_education_certificate = serializers.SerializerMethodField()
    
    class Meta:
        model = Documents
        fields = '__all__'
    
    def get_document_url(self, obj, field_name):
        request = self.context.get('request')
        file_field = getattr(obj, field_name)
        if file_field and request:
            return request.build_absolute_uri(file_field.url)
        return None
    
    def get_photo(self, obj):
        return self.get_document_url(obj, 'photo')
    
    def get_resume(self, obj):
        return self.get_document_url(obj, 'resume')
    
    def get_aadhar_card(self, obj):
        return self.get_document_url(obj, 'aadhar_card')
    
    def get_pan_card(self, obj):
        return self.get_document_url(obj, 'pan_card')
    
    def get_higher_education_certificate(self, obj):
        return self.get_document_url(obj, 'higher_education_certificate')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'user_type']
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        # Check if user already exists with this email
        if self.instance and User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class EmployeeListSerializer(serializers.ModelSerializer):
    """Serializer for listing employees with basic info"""
    department = DepartmentSerializer(read_only=True)
    designation = DesignationSerializer(read_only=True)
    email = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = ['id', 'name', 'father_name', 'contact_no', 'alternate_contact_no', 
                  'gender', 'pan_no', 'aadhar_no', 'dob', 'email', 'department', 
                  'designation', 'joining_date', 'basic_salary', 'is_active', 
                  'created_at', 'user']
    
    def get_email(self, obj):
        return obj.user.email if obj.user else None
    
    def get_user(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'email': obj.user.email,
                'is_active': obj.user.is_active,
            }
        return None


class EmployeeDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for employee with all related data"""
    department = DepartmentSerializer(read_only=True)
    designation = DesignationSerializer(read_only=True)
    current_address = AddressSerializer(read_only=True)
    permanent_address = AddressSerializer(read_only=True)
    bank_details = BankDetailsSerializer(read_only=True)
    documents = DocumentsSerializer(read_only=True)
    user = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = '__all__'
    
    def get_user(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'email': obj.user.email,
                'is_active': obj.user.is_active,
            }
        return None
    
    def get_email(self, obj):
        return obj.user.email if obj.user else None


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating employees"""
    department_id = serializers.IntegerField(write_only=True)
    designation_id = serializers.IntegerField(write_only=True)
    current_address = AddressSerializer()
    permanent_address = AddressSerializer()
    bank_details = BankDetailsSerializer()
    documents = DocumentsSerializer()
    
    class Meta:
        model = Employee
        fields = ['name', 'father_name', 'contact_no', 'alternate_contact_no', 'gender',
                  'pan_no', 'aadhar_no', 'dob', 'joining_date', 'basic_salary', 'is_active',
                  'department_id', 'designation_id', 'current_address', 'permanent_address',
                  'bank_details', 'documents']
    
    def create(self, validated_data):
        # Extract related data
        current_address_data = validated_data.pop('current_address')
        permanent_address_data = validated_data.pop('permanent_address')
        bank_details_data = validated_data.pop('bank_details')
        documents_data = validated_data.pop('documents')
        
        department_id = validated_data.pop('department_id')
        designation_id = validated_data.pop('designation_id')
        
        # Get department and designation
        department = Department.objects.get(id=department_id)
        designation = Designation.objects.get(id=designation_id)
        
        # Create nested objects
        current_address = Address.objects.create(**current_address_data, address_type='current')
        permanent_address = Address.objects.create(**permanent_address_data, address_type='permanent')
        bank_details = BankDetails.objects.create(**bank_details_data)
        documents = Documents.objects.create(**documents_data)
        
        # Create employee
        employee = Employee.objects.create(
            department=department,
            designation=designation,
            current_address=current_address,
            permanent_address=permanent_address,
            bank_details=bank_details,
            documents=documents,
            **validated_data
        )
        
        return employee

