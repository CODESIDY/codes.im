import WordCounter from './WordCounter.astro';
import CidrCalculator from './CidrCalculator.astro';
import UserAgentParser from './UserAgentParser.astro';
import FakeDataGenerator from './FakeDataGenerator.astro';
import LlmPlayground from './LlmPlayground.astro';
import LlmCostCalculator from './LlmCostCalculator.astro';
import VectorSimilarity from './VectorSimilarity.astro';
import JsonPath from './JsonPath.astro';
import JsonDiff from './JsonDiff.astro';
import ImageCompressor from './ImageCompressor.astro';
import ImageToBase64 from './ImageToBase64.astro';
import ChmodCalculator from './ChmodCalculator.astro';
import CaseConverter from './CaseConverter.astro';
import ChatFormatConverter from './ChatFormatConverter.astro';
import JsonSchemaValidator from './JsonSchemaValidator.astro';
import JsonToCode from './JsonToCode.astro';
import LlmsTxtGenerator from './LlmsTxtGenerator.astro';
import MarkdownEditor from './MarkdownEditor.astro';
import NumberBaseConverter from './NumberBaseConverter.astro';
import PasswordGenerator from './PasswordGenerator.astro';
import QrCodeGenerator from './QrCodeGenerator.astro';
import TextEscape from './TextEscape.astro';
import CronParser from './CronParser.astro';
import CsvJson from './CsvJson.astro';
import JsonRepair from './JsonRepair.astro';
import OpenapiToTools from './OpenapiToTools.astro';
import PromptTemplate from './PromptTemplate.astro';
import TextChunker from './TextChunker.astro';
import YamlJson from './YamlJson.astro';
import CurlConverter from './CurlConverter.astro';
import JsonlValidator from './JsonlValidator.astro';
import JsonSchemaGenerator from './JsonSchemaGenerator.astro';
import JsonToZod from './JsonToZod.astro';
import LlmStreamParser from './LlmStreamParser.astro';
import MarkdownCleaner from './MarkdownCleaner.astro';
import McpConfigGenerator from './McpConfigGenerator.astro';
import SqlFormatter from './SqlFormatter.astro';
import TextDiff from './TextDiff.astro';
import TokenCounter from './TokenCounter.astro';
import Base64 from './Base64.astro';
import ColorConverter from './ColorConverter.astro';
import HashGenerator from './HashGenerator.astro';
import JsonFormatter from './JsonFormatter.astro';
import JsonToTypescript from './JsonToTypescript.astro';
import JwtDecoder from './JwtDecoder.astro';
import RegexTester from './RegexTester.astro';
import Timestamp from './Timestamp.astro';
import UrlEncoder from './UrlEncoder.astro';
import UuidGenerator from './UuidGenerator.astro';

/** slug → widget. Adding a tool = registry entry + component + one line here. */
export const toolComponents: Record<string, typeof JsonFormatter> = {
  'json-formatter': JsonFormatter,
  'json-to-typescript': JsonToTypescript,
  base64: Base64,
  'url-encoder': UrlEncoder,
  timestamp: Timestamp,
  'jwt-decoder': JwtDecoder,
  'regex-tester': RegexTester,
  'uuid-generator': UuidGenerator,
  'hash-generator': HashGenerator,
  'color-converter': ColorConverter,
  'json-schema-generator': JsonSchemaGenerator,
  'json-to-zod': JsonToZod,
  'token-counter': TokenCounter,
  'markdown-cleaner': MarkdownCleaner,
  'mcp-config-generator': McpConfigGenerator,
  'jsonl-validator': JsonlValidator,
  'llm-stream-parser': LlmStreamParser,
  'curl-converter': CurlConverter,
  'sql-formatter': SqlFormatter,
  'cron-parser': CronParser,
  'text-diff': TextDiff,
  'json-repair': JsonRepair,
  'prompt-template': PromptTemplate,
  'chat-format-converter': ChatFormatConverter,
  'openapi-to-tools': OpenapiToTools,
  'text-chunker': TextChunker,
  'yaml-json': YamlJson,
  'csv-json': CsvJson,
  'json-schema-validator': JsonSchemaValidator,
  'llms-txt-generator': LlmsTxtGenerator,
  'json-to-code': JsonToCode,
  'markdown-editor': MarkdownEditor,
  'password-generator': PasswordGenerator,
  'qr-code-generator': QrCodeGenerator,
  'number-base-converter': NumberBaseConverter,
  'text-escape': TextEscape,
  'llm-cost-calculator': LlmCostCalculator,
  'vector-similarity': VectorSimilarity,
  'json-path': JsonPath,
  'json-diff': JsonDiff,
  'image-compressor': ImageCompressor,
  'image-to-base64': ImageToBase64,
  'chmod-calculator': ChmodCalculator,
  'case-converter': CaseConverter,
  'word-counter': WordCounter,
  'cidr-calculator': CidrCalculator,
  'user-agent-parser': UserAgentParser,
  'fake-data-generator': FakeDataGenerator,
  'llm-api-playground': LlmPlayground,
};
