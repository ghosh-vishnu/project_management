import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Tooltip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import axios from "axios";
import BASE_API_URL from "../../data";
import { getToken } from "../../Token";

const SprintRetrospective = ({ sprintId }) => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState("");
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);

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

  // AI: Generate Retrospective Insights
  const handleAIGenerateInsights = async () => {
    if (!sprintId) return;

    try {
      setAiInsightsLoading(true);
      const accessToken = getToken("accessToken");
      if (!accessToken) return;

      const response = await axios.get(
        `${BASE_API_URL}/sprints/${sprintId}/ai/retrospective-insights/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.insights) {
        setAiInsights(response.data.insights);
        setAiInsightsOpen(true);
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      alert("Failed to generate insights. Please try again.");
    } finally {
      setAiInsightsLoading(false);
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
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Typography variant="h6">
          Sprint Retrospective
        </Typography>
        <Tooltip title="AI: Generate Insights">
          <Button
            variant="outlined"
            startIcon={aiInsightsLoading ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
            onClick={handleAIGenerateInsights}
            disabled={aiInsightsLoading}
            size="small"
          >
            AI Insights
          </Button>
        </Tooltip>
      </Box>
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

      {/* AI Insights Dialog */}
      <Dialog
        open={aiInsightsOpen}
        onClose={() => setAiInsightsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            <span>AI Retrospective Insights</span>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            {aiInsights || "Generating insights..."}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiInsightsOpen(false)}>Close</Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(aiInsights);
              alert("Insights copied to clipboard!");
            }}
            variant="contained"
          >
            Copy
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SprintRetrospective;

