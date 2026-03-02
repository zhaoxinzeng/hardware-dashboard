import React from 'react';
import { CheckCircle2, Loader2, Clock } from 'lucide-react';

const frameworks = ['ERNIE 推理', 'PaddlePaddle/FastDeploy 推理', 'PaddleOCR-VL 推理', 'PaddleFormers 推理', 'ERNIE 训练'];
const hardwareVendors = ['NVIDIA', '昇腾', '昆仑芯', '燧原', '海光', '天数', 'Intel Gaudi', '沐曦'];

type Status = 'ready' | 'progress' | 'planned';

const statusMap: Record<string, Record<string, Status>> = {
  'ERNIE 推理': {
    NVIDIA: 'ready',
    昇腾: 'ready',
    昆仑芯: 'ready',
    燧原: 'ready',
    海光: 'progress',
    天数: 'ready',
    'Intel Gaudi': 'ready',
    沐曦: 'ready',
  },
  'PaddlePaddle/FastDeploy 推理': {
    NVIDIA: 'ready',
    昇腾: 'ready',
    昆仑芯: 'ready',
    燧原: 'ready',
    海光: 'progress',
    天数: 'ready',
    'Intel Gaudi': 'ready',
    沐曦: 'ready',
  },
  'PaddleOCR-VL 推理': {
    NVIDIA: 'planned',
    昇腾: 'ready',
    昆仑芯: 'ready',
    燧原: 'progress',
    海光: 'ready',
    天数: 'progress',
    'Intel Gaudi': 'planned',
    沐曦: 'ready',
  },
  'PaddleFormers 推理': {
    NVIDIA: 'planned',
    昇腾: 'planned',
    昆仑芯: 'ready',
    燧原: 'planned',
    海光: 'planned',
    天数: 'ready',
    'Intel Gaudi': 'planned',
    沐曦: 'ready',
  },
  'ERNIE 训练': {
    NVIDIA: 'planned',
    昇腾: 'ready',
    昆仑芯: 'ready',
    燧原: 'planned',
    海光: 'planned',
    天数: 'ready',
    'Intel Gaudi': 'planned',
    沐曦: 'ready',
  },
};

const docLinks: Record<string, Record<string, string | undefined>> = {
  'ERNIE 推理': {
    海光: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/hygon_dcu.md',
    燧原: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/Enflame_gcu.md',
    天数: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/iluvatar_gpu.md',
    'Intel Gaudi': 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/intel_gaudi.md',
    昆仑芯: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/kunlunxin_xpu.md',
    沐曦: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/metax_gpu.md',
    NVIDIA: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/nvidia_gpu.md',
    昇腾: undefined,
  },
  'PaddlePaddle/FastDeploy 推理': {
    海光: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/hygon_dcu.md',
    燧原: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/Enflame_gcu.md',
    天数: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/iluvatar_gpu.md',
    'Intel Gaudi': 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/intel_gaudi.md',
    昆仑芯: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/kunlunxin_xpu.md',
    沐曦: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/metax_gpu.md',
    NVIDIA: 'https://github.com/PaddlePaddle/FastDeploy/blob/develop/docs/zh/get_started/installation/nvidia_gpu.md',
    昇腾: undefined,
  },
  'PaddleOCR-VL 推理': {
    昇腾: 'https://www.paddleocr.ai/latest/version3.x/pipeline_usage/PaddleOCR-VL-NPU.html',
    昆仑芯: 'https://www.paddleocr.ai/latest/version3.x/pipeline_usage/PaddleOCR-VL-XPU.html',
    海光: 'https://www.paddleocr.ai/latest/version3.x/pipeline_usage/PaddleOCR-VL-DCU.html',
    沐曦: 'https://www.paddleocr.ai/latest/version3.x/pipeline_usage/PaddleOCR-VL-MetaX-GPU.html',
    燧原: undefined,
    天数: undefined,
    NVIDIA: undefined,
    'Intel Gaudi': undefined,
  },
  'PaddleFormers 推理': {
    昆仑芯: 'https://github.com/PaddlePaddle/PaddleFormers/blob/release/v1.0/docs/zh/XPU_installation_guide.md',
    天数: 'https://github.com/PaddlePaddle/PaddleFormers/blob/release/v1.0/docs/zh/ILUVATAR-GPU_installation_guide.md',
    沐曦: 'https://github.com/PaddlePaddle/PaddleFormers/blob/release/v1.0/docs/zh/Metax-GPU_installation_guide.md',
    NVIDIA: undefined,
    昇腾: undefined,
    海光: undefined,
    燧原: undefined,
    'Intel Gaudi': undefined,
  },
  'ERNIE 训练': {
    昇腾: 'https://github.com/PaddlePaddle/ERNIE/blob/develop/docs/source/devices/README_NPU.md',
    天数: 'https://github.com/PaddlePaddle/ERNIE/blob/develop/docs/source/devices/README_ILUVATAR_GPU.md',
    沐曦: 'https://github.com/PaddlePaddle/ERNIE/blob/develop/docs/source/devices/README_METAX_GPU.md',
    昆仑芯: 'https://github.com/PaddlePaddle/ERNIE/blob/develop/docs/source/devices/README_XPU.md',
    NVIDIA: undefined,
    海光: undefined,
    燧原: undefined,
    'Intel Gaudi': undefined,
  },
};

const StatusBadge: React.FC<{ status: Status; href?: string }> = ({ status, href }) => {
  const classMap: Record<Status, string> = {
    ready: 'inline-flex flex-row items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap min-w-[96px]',
    progress: 'inline-flex flex-row items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap min-w-[96px]',
    planned: 'inline-flex flex-row items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 whitespace-nowrap min-w-[96px]',
  };
  const content =
    status === 'ready' ? (
      <>
        <CheckCircle2 className="w-3 h-3" />
        <span className="text-xs font-semibold">已跑通</span>
      </>
    ) : status === 'progress' ? (
      <>
        <Loader2 className="w-3 h-3 animate-spin-slow" />
        <span className="text-xs font-semibold">适配中</span>
      </>
    ) : (
      <>
        <Clock className="w-3 h-3" />
        <span className="text-xs font-semibold">规划中</span>
      </>
    );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${classMap[status]} cursor-pointer hover:opacity-90`}
      >
        {content}
      </a>
    );
  }
  return <div className={classMap[status]}>{content}</div>;
};

export const AdaptationMatrixV2: React.FC = () => {
  return (
    <div className="w-full glass-panel overflow-hidden">
      <div className="p-6 border-b border-border-subtle/50">
        <h2 className="text-2xl font-bold tracking-tight">ERNIE/PaddlePaddle 硬件适配矩阵</h2>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">实时追踪各大模型与底层生态硬件的兼容性及优化进度</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-4 font-semibold text-sm text-[var(--color-text-secondary)] border-b border-border-subtle/50">
                模型 / 框架
              </th>
              {hardwareVendors.map((vendor) => (
                <th key={vendor} className="p-4 font-semibold text-sm text-gray-900 border-b border-border-subtle/50 text-center">
                  {vendor}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/30">
            {frameworks.map((fw) => (
              <tr key={fw} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-4 font-medium text-gray-900 text-center align-middle">{fw}</td>
                {hardwareVendors.map((vendor) => (
                  <td key={vendor} className="p-3 text-center align-middle">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={statusMap[fw]?.[vendor] || 'planned'} href={docLinks[fw]?.[vendor]} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
