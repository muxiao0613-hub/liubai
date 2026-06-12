import { useState } from 'react'
import { Sparkles, Send, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { CityRecord } from '@/types'
import { Button } from '@/components/ui/Button'

const QUICK_QUESTIONS = [
  '有什么必去景点？',
  '当地特色美食？',
  '最佳旅行季节？',
  '周边值得一去的城市？',
]

interface AIAssistantProps {
  city: CityRecord
  apiKey: string
}

export function AIAssistant({ city, apiKey }: AIAssistantProps) {
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const ask = async (question: string) => {
    if (!apiKey) {
      setResponse('请先在设置中填写 DeepSeek API Key')
      setExpanded(true)
      return
    }
    setLoading(true)
    setExpanded(true)
    setResponse('')

    const checkinContext = city.checkins.length > 0
      ? `用户已在此打卡：${city.checkins.map(c => c.name).join('、')}。`
      : ''

    const systemPrompt = `你是一位资深旅行顾问，熟悉中国各地的旅游资源。
用户正在查看【${city.cityName}】（${city.provinceName}）。${checkinContext}
请用简洁友好的语气给出实用的旅行建议，重点推荐当地最值得体验的内容。
回答控制在300字以内，用小标题分段，易于阅读。`

    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          max_tokens: 600,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
          ],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      setResponse(data.choices?.[0]?.message?.content ?? '无法获取回答')
    } catch (err) {
      setResponse(`请求失败：${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    if (input.trim()) {
      ask(input.trim())
      setInput('')
    }
  }

  return (
    <div className="border border-[#e5e2d8] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 hover:bg-[#faf9f6] transition-colors text-left"
      >
        <Sparkles size={16} className="text-[#f0a500]" />
        <span className="text-sm font-medium text-[#1a1a1a] flex-1">AI 旅行顾问</span>
        {expanded
          ? <ChevronUp size={14} className="text-[#c5c2b8]" />
          : <ChevronDown size={14} className="text-[#c5c2b8]" />}
      </button>

      {expanded && (
        <div className="p-3 pt-0 space-y-3 border-t border-[#e5e2d8]">
          <div className="flex flex-wrap gap-1.5 pt-3">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => ask(q)}
                disabled={loading}
                className="px-2.5 py-1 text-xs bg-[#faf9f6] border border-[#e5e2d8] rounded-full text-[#666660] hover:border-[#f0a500]/50 hover:text-[#1a1a1a] transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-[#f0a500] text-sm">
              <Loader2 size={14} className="animate-spin" />
              正在思考...
            </div>
          )}
          {response && !loading && (
            <div className="text-xs text-[#444440] leading-relaxed bg-[#faf9f6] rounded-lg p-3 border border-[#e5e2d8] prose prose-xs max-w-none
              [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-[#1a1a1a] [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:first:mt-0
              [&_strong]:font-semibold [&_strong]:text-[#1a1a1a]
              [&_ul]:pl-3 [&_ul]:my-1 [&_li]:my-0.5
              [&_p]:my-1 [&_p:first-child]:mt-0">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="问点什么..."
              className="flex-1 bg-[#faf9f6] border border-[#e5e2d8] rounded-lg px-3 py-1.5 text-xs text-[#1a1a1a] placeholder-[#c5c2b8] focus:outline-none focus:border-[#f0a500]"
            />
            <Button size="sm" onClick={handleSend} disabled={!input.trim() || loading}>
              <Send size={12} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
