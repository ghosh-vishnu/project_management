import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, TextField, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import BASE_API_URL from "../../data";
import { getToken } from "../../Token";

const SprintRetrospective = ({ sprintId }) => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRetrospective();
  }, [sprintId]);

  const fetchRetrospective = async () => {
    try {
      setLoading(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) return;

      const response = await axios.get(
        `${BASE_API_URL}/sprints/${sprintId}/retrospective/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setNotes(response.data.notes || "");
    } catch (error) {
      // If no retrospective exists yet, that's okay
      if (error.response?.status !== 404) {
        console.error("Error fetching retrospective:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) return;

      await axios.post(
        `${BASE_API_URL}/sprints/${sprintId}/retrospective/`,
        {
          notes: notes,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      alert("Retrospective saved successfully!");
    } catch (error) {
      console.error("Error saving retrospective:", error);
      alert("Failed to save retrospective. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper className="p-6">
        <Typography>Loading retrospective...</Typography>
      </Paper>
    );
  }

  return (
    <Paper className="p-6">
      <Typography variant="h6" className="mb-4">
        Sprint Retrospective
      </Typography>
      <Typography variant="body2" className="mb-4 text-gray-600">
        Document what went well, what didn't go well, and what can be improved
        in the next sprint.
      </Typography>

      <Box className="mb-4">
        <TextField
          fullWidth
          multiline
          rows={12}
          placeholder="Enter your retrospective notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          variant="outlined"
          className="mb-4"
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Retrospective"}
        </Button>
      </Box>
    </Paper>
  );
};

export default SprintRetrospective;

