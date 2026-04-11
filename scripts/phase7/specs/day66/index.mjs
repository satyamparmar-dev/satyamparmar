import cfg from "../../../gen-phase7/day66.mjs";
import useCasesMarkdown from "./useCases.mjs";
import { getMcqQuestionsForDay } from "../../lib/mcqQuestions.mjs";

export default {
  cfg,
  useCasesMarkdown,
  mcqQuestions: getMcqQuestionsForDay(66),
};
