"use client"

import { Plus, Trash2, Beaker, Eye, EyeOff } from "lucide-react"

interface Testcase {
  id?: string | number
  input: string;            // mapping fixed
  expected_output: string;
  is_sample: boolean
}

interface TestcaseManagerProps {
  testcases: Testcase[]
  onChange: (testcases: Testcase[]) => void
}

export default function TestcaseManager({ testcases, onChange }: TestcaseManagerProps) {
  
  const addTestcase = () => {
    const newTestcase: Testcase = {
      id: Date.now(),
      input: "",             // naming sync with DB
      expected_output: "",
      is_sample: false
    }
    onChange([...testcases, newTestcase])
  }

  const updateTestcase = (index: number, updatedFields: Partial<Testcase>) => {
    const newTestcases = [...testcases]
    newTestcases[index] = { ...newTestcases[index], ...updatedFields }
    onChange(newTestcases)
  }

  const removeTestcase = (index: number) => {
    onChange(testcases.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Beaker className="text-orange-500" size={20} />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Validation Sets</h3>
        </div>
        <button type="button" onClick={addTestcase} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 transition-all">
          <Plus size={14} /> Add Case
        </button>
      </div>

      <div className="space-y-4">
        {testcases.map((tc, index) => (
          <div key={tc.id || index} className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem]">
            <div className="flex justify-between mb-4">
              <button
                type="button"
                onClick={() => updateTestcase(index, { is_sample: !tc.is_sample })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${tc.is_sample ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"}`}
              >
                {tc.is_sample ? <Eye size={12} /> : <EyeOff size={12} />}
                {tc.is_sample ? "Sample" : "Hidden"}
              </button>
              <button type="button" onClick={() => removeTestcase(index)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <textarea 
                placeholder="Input" 
                value={tc.input} 
                className="bg-white p-4 rounded-xl text-xs font-mono h-24 outline-none border border-slate-100 focus:ring-2 focus:ring-orange-500/10"
                onChange={(e) => updateTestcase(index, { input: e.target.value })}
              />
              <textarea 
                placeholder="Expected Output" 
                value={tc.expected_output} 
                className="bg-white p-4 rounded-xl text-xs font-mono h-24 outline-none border border-slate-100 focus:ring-2 focus:ring-orange-500/10"
                onChange={(e) => updateTestcase(index, { expected_output: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}