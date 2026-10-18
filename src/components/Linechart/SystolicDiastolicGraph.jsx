import React, { useEffect, useState } from "react";
import { Box } from "../../component-library";
import {
  getSystolicIdByTitle,
  getDialysisSystolicIdByTitle,
} from "../../ApiCalls/readingsApis";
import LineChartComponentSys from "../linecomponent-sys-dys/LineChartComponentSys";
import LineChartDialyisisSys from "./Linechart_Dialysis/LineChartDialyisisSys";

/** Insert text after keyword in title (main: "Systolic and Diastolic"). */
export const buildCombinedTitle = (baseTitle, keyword, insertText) => {
  if (!baseTitle) return baseTitle;
  const lower = baseTitle.toLowerCase();
  const index = lower.indexOf(keyword);
  if (index === -1) return baseTitle;
  const endIndex = index + keyword.length;
  return baseTitle.slice(0, endIndex) + insertText + baseTitle.slice(endIndex);
};

/**
 * Combined sys+dia chart keyed by systolic question id (main parity).
 * Resolves systolic id when opened from a diastolic tile.
 */
const SystolicDiastolicGraph = ({
  question,
  userId,
  isDialysis = false,
  aspect = 2 / 1,
  enableGraphEditPanel = false,
  showEditPanel = false,
  onToggleEditPanel,
  /** Notify parent of resolved systolic id (for edit-panel table alignment). */
  onSystolicIdResolved,
}) => {
  const [systolicId, setSystolicId] = useState(question?.id ?? null);
  const [loading, setLoading] = useState(false);

  const title = question?.title || "";
  const titleLower = title.toLowerCase();
  const isSystolic = titleLower.includes("systolic");
  const isDiastolic = titleLower.includes("diastolic");

  useEffect(() => {
    let isMounted = true;

    const fetchSystolicId = async () => {
      if (!isDiastolic || isSystolic) {
        const id = question?.id ?? null;
        setSystolicId(id);
        onSystolicIdResolved?.(id);
        return;
      }

      setLoading(true);
      try {
        const response = isDialysis
          ? await getDialysisSystolicIdByTitle(title)
          : await getSystolicIdByTitle(title);

        if (isMounted) {
          const id = response?.data ?? null;
          setSystolicId(id);
          onSystolicIdResolved?.(id);
        }
      } catch (error) {
        console.error("Error fetching systolic ID:", error);
        if (isMounted) {
          setSystolicId(null);
          onSystolicIdResolved?.(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSystolicId();
    return () => {
      isMounted = false;
    };
  }, [isDialysis, isDiastolic, isSystolic, question?.id, title]);

  if (isDiastolic && loading) {
    return <Box className="text-sm text-muted">Loading...</Box>;
  }

  if (isDiastolic && !systolicId) {
    return <Box className="text-sm text-muted">No systolic ID found.</Box>;
  }

  const chartTitle = isSystolic
    ? buildCombinedTitle(title, "systolic", " and Diastolic")
    : buildCombinedTitle(title, "diastolic", " and Systolic");

  const chartQuestionId = isSystolic ? question?.id : systolicId;
  const editPanelProps = {
    enableGraphEditPanel,
    showEditPanel,
    onToggleEditPanel,
  };

  if (isDialysis) {
    return (
      <LineChartDialyisisSys
        aspect={aspect}
        questionId={chartQuestionId}
        user_id={userId}
        title={chartTitle}
        unit={question?.unit}
        {...editPanelProps}
      />
    );
  }

  return (
    <LineChartComponentSys
      aspect={aspect}
      questionId={chartQuestionId}
      user_id={userId}
      title={chartTitle}
      unit={question?.unit}
      {...editPanelProps}
    />
  );
};

export default SystolicDiastolicGraph;
