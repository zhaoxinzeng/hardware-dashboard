import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import axios from 'axios'
import * as cheerio from 'cheerio'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // Dev-only middleware to proxy and parse AI Studio courses
    {
      name: 'aistudio-courses-proxy',
      configureServer(server) {
        server.middlewares.use('/api/aistudio/courses', async (req, res) => {
          try {
            const url = 'https://aistudio.baidu.com/course/list'
            const { data: html } = await axios.get(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'text/html',
              },
            })
            const $ = cheerio.load(html)
            const results: Array<{
              title: string
              imageUrl: string
              summary: string
              keywords: string[]
              link: string
            }> = []
            const hwKeywords = ['NVIDIA','昇腾','昆仑芯','燧原','海光','天数','Gaudi','HPU','XPU','MetaX','昆仑']
            $('a[href*="/course/"]').each((_, el) => {
              const link = $(el).attr('href') || ''
              const title = $(el).text().trim() || $(el).attr('title') || ''
              const imageUrl =
                $(el).find('img').attr('src') ||
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop'
              // Try to find a nearby summary text
              const parent = $(el).closest('div')
              const summary =
                parent.find('p').first().text().trim() ||
                parent.text().replace(/\s+/g, ' ').trim().slice(0, 140)
              const detected = hwKeywords.filter((kw) => (title + summary).includes(kw))
              if (detected.length > 0) {
                results.push({
                  title: title || '未命名课程',
                  imageUrl,
                  summary: summary || '课程简介暂不可用',
                  keywords: detected,
                  link: link.startsWith('http') ? link : `https://aistudio.baidu.com${link}`,
                })
              }
            })
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, data: results.slice(0, 8) }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            const message = err instanceof Error ? err.message : 'fetch_failed'
            res.end(JSON.stringify({ success: false, error: message }))
          }
        })
      },
    } as Plugin,
  ],
})
