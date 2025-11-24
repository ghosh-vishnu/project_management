import React, { useState, useEffect } from "react";
import { Modal, Box, TextField, Button, Grid2, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import BASE_API_URL from "../../data";
import { getToken } from "../../Token";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";

const CreateTaskModal = ({ open, onClose, sprintId, onTaskCreated }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (open) {
      fetchUsers();
      reset();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) return;

      // Fetch users for sprint task assignment
      const response = await axios.get(`${BASE_API_URL}/sprint-users/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) return;

      // Get user ID - handle both string and number
      // Allow null to create unassigned task
      let assignedToId = null;
      if (data.assigned_to_id && data.assigned_to_id !== "") {
        assignedToId = parseInt(data.assigned_to_id);
      }

      const taskData = {
        sprint: parseInt(sprintId),
        title: data.title,
        status: "todo",
        due_date: data.due_date || null,
        description: data.description || "",
        priority: data.priority || "medium",
        assigned_to_id: assignedToId, // Include null to allow unassigned tasks
      };

      await axios.post(
        `${BASE_API_URL}/sprint-tasks/`,
        taskData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      reset();
      onClose();
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 600,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create Task</h2>
          <Button onClick={onClose} color="inherit">
            <CloseIcon />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid2 container spacing={2}>
            <Grid2 size={12}>
              <TextField
                fullWidth
                label="Task Title"
                {...register("title", { required: "Task title is required" })}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Grid2>

            <Grid2 size={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Controller
                  name="assigned_to_id"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select {...field} label="Assign To">
                      <MenuItem value="">Unassigned</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id.toString()}>
                          {user.name || user.username}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid2>

            <Grid2 size={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Controller
                  name="priority"
                  control={control}
                  defaultValue="medium"
                  render={({ field }) => (
                    <Select {...field} label="Priority">
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid2>

            <Grid2 size={12}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                {...register("due_date")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>

            <Grid2 size={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                {...register("description")}
              />
            </Grid2>
          </Grid2>

          <div className="flex justify-end gap-4 mt-4">
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default CreateTaskModal;

