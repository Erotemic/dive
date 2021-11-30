import type {
  DatasetMeta, DatasetMetaMutable, DatasetType,
  Pipe, SubType, MediaImportResponse,
} from 'dive-common/apispec';
import { Attribute } from 'vue-media-annotator/use/useAttributes';


export const JsonMetaCurrentVersion = 1;
export const SettingsCurrentVersion = 1;

export interface Settings {
  // version a schema version
  version: number;
  // viamePath path to viame install
  viamePath: string;
  // dataPath path to a userspace data directory
  dataPath: string;
  // readonly flag
  readonlyMode: boolean;
  // overrides of user-provided settings
  overrides: {
    // externally force the VIAME path
    viamePath?: string;
    // externally force read only mode flag
    readonlyMode?: boolean;
  };
}

// Handles Importing and storing of multi camera data

export interface Camera {
  type: 'image-sequence' | 'video';
  originalBasePath: string;
  originalImageFiles: string[];
  originalVideoFile: string;
  transcodedImageFiles: string[];
  transcodedVideoFile: string;
  imageListPath?: string;
}

export interface MultiCamDesktop {
  cameras: Record<string, Camera>;
  //Calibration file in .npz format used for stereo or other cameras
  calibration?: string;
  // Default Display Key for showing multiCam
  defaultDisplay: string;
}

/**
 * JsonMeta is a SUBSET of DatasetMeta contained within
 * the JsonFileSchema.  The remaining parts of DatasetMeta must
 * be generated at load time.
 */
export interface JsonMeta extends DatasetMetaMutable {
  // version used to manage schema migrations
  version: number;

  // immutable dataset type
  type: DatasetType;

  // immutable datset identifier
  id: string;

  // this will become mutable in the future.
  fps: number;

  // the true original video framerate
  originalFps: number;

  // the original name derived from media path
  name: string;

  // the import time of the dataset
  createdAt: string;

  // absolute base path on disk where dataset was imported from.
  // If data was imported from image list, originalBasePath is '' (empty string)
  originalBasePath: string;

  // video file path
  // relative to originalBasePath
  originalVideoFile: string;

  // output of web safe transcoding
  // relative to project path
  transcodedVideoFile: string;

  // ordered image filenames IF this is an image dataset
  // If paths are relative, they're relative to originalBasePath
  // If paths are absolute, originalBasePath will be '' (empty string)
  originalImageFiles: string[];

  // ordered image filenames of transcoded images
  // relative to project path
  transcodedImageFiles: string[];

  // manifest source path IF image list was used.
  imageListPath?: string;

  // If the dataset required transcoding, specify the job
  // key that ran transcoding
  transcodingJobKey?: string;

  // attributes are not datasetMetaMutable and are stored separate
  attributes?: Record<string, Attribute>;

  // confidence filter threshold for exporting
  confidenceFilters?: Record<string, number>;

  // Stereo or multi-camera datasets with uniform type (all images, all video)
  multiCam: MultiCamDesktop | null;

  // Stereo or multi-camera datasets with uniform type (all images, all video)
  subType: SubType;
}

export type DesktopMetadata = DatasetMeta & JsonMeta;

interface NvidiaSmiTextRecord {
  _text: string;
}

export interface NvidiaSmiReply {
  // output condensed output from nvidia smi xml converted to json
  output: {
    nvidia_smi_log: {
      driver_version: NvidiaSmiTextRecord;
      cuda_version: NvidiaSmiTextRecord;
      attached_gpus: NvidiaSmiTextRecord;
    };
  } | null;
  // process exit code
  exitCode: number | null;
  // error message
  error: string;
}

/** TODO promote to apispec */
export interface RunPipeline {
  datasetId: string;
  pipeline: Pipe;
}

/** TODO promote to apispec */
export interface RunTraining {
  // datasets to run training on
  datasetIds: string[];
  // new pipeline name to be created
  pipelineName: string;
  // training configuration file name
  trainingConfig: string;
  // train only on annotated frames
  annotatedFramesOnly: boolean;
  // contents of labels.txt file
  labelText?: string;
}

export interface ConversionArgs {
  meta: JsonMeta;
  mediaList: [string, string][];
}

export interface DesktopJob {
  // key unique identifier for this job
  key: string;
  // command that was run
  command: string;
  // jobType identify type of job
  jobType: 'pipeline' | 'training' | 'conversion';
  // title whatever humans should see this job called
  title: string;
  // arguments to creation
  args: RunPipeline | RunTraining | ConversionArgs;
  // datasetIds of the involved datasets
  datasetIds: string[];
  // pid of the process spawned
  pid: number;
  // workingDir of the job's output
  workingDir: string;
  // exitCode if set, the job exited already
  exitCode: number | null;
  // startTime time of process initialization
  startTime: Date;
  // endTime time of process exit
  endTime?: Date;
}

export interface DesktopMediaImportResponse extends MediaImportResponse {
  jsonMeta: JsonMeta;
  trackFileAbsPath: string;
  multiCamTrackFiles: null | Record<string, string>;
  forceMediaTranscode: boolean;
}

export interface DesktopJobUpdate extends DesktopJob {
  // body contents of update payload
  body: string[];
}

export type DesktopJobUpdater = (msg: DesktopJobUpdate) => void;

export interface FFProbeResults {
  streams?: [{
    avg_frame_rate?: string;
    r_frame_rate?: string;
    codec_type?: string;
    codec_name?: string;
    sample_aspect_ratio?: string;
    width?: number;
    height?: number;
  }];
}

interface FFProbeFrame {
  best_effort_timestamp_time: number;
}
export interface FFProbeFrameResults{
  frames: FFProbeFrame[];
}

export type ConvertMedia =
(settings: Settings,
  args: ConversionArgs,
  updater: DesktopJobUpdater) => Promise<DesktopJob>;

export interface ExportDatasetArgs {
  id: string;
  exclude: boolean;
  path: string;
  typeFilter: Set<string>;
}

export interface CheckMediaResults {
  websafe: boolean;
  originalFpsString: string;
  originalFps: number;
  videoDimensions: {width: number; height: number};
}
