import React, { useState } from 'react'
import axios from 'axios'

const App = () => {
  const [content, setContent] = useState("")
  const [tone, setTone] = useState("formal")
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const sendRequest = async () => {
    setLoading(true)
    setReply("")
    setError("")
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/generate`, { content, tone })
      setReply(res.data)
    } catch (err) {
      setError("Failed to generate reply")
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-xl w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">AI Email Assistant</h1>

        {/* Input area */}
        <div className="space-y-2">
          <label className="block text-gray-700">Original Email:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            placeholder="Paste the email you want to reply to..."
          ></textarea>

          <label className="block text-gray-700">Select Tone:</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
          </select>
        </div>

        {/* Generate button */}
        <button
          onClick={sendRequest}
          disabled={loading || !content}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 font-semibold transition duration-200 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Reply"}
        </button>

        {/* Output */}
        {reply && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <h2 className="font-semibold mb-2">AI Reply:</h2>
            <p className="text-gray-800 whitespace-pre-wrap">{reply}</p>
            <button onClick={()=>navigator.clipboard.writeText(reply)}
              className="bg-green-500 hover:bg-green-600 mt-4 text-white rounded-md px-3 py-1 text-sm font-medium transition duration-200" >
              Copy Response
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}

export default App