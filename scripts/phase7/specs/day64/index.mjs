import cfg from "../../../gen-phase7/day64.mjs";
import useCasesMarkdown from "./useCases.mjs";
import { getMcqQuestionsForDay } from "../../lib/mcqQuestions.mjs";

export default {
  cfg,
  useCasesMarkdown,
  mcqQuestions: getMcqQuestionsForDay(64),
};
