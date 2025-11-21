require 'webrick'
require 'net/http'
require 'json'
require 'uri'

PORT = 3000
TDX_URL = 'https://tdx.transportdata.tw'

server = WEBrick::HTTPServer.new :Port => PORT, :DocumentRoot => "./"

# Helper to set CORS headers
def set_cors_headers(res)
  res['Access-Control-Allow-Origin'] = '*'
  res['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  res['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
end

# Auth Proxy
server.mount_proc '/auth' do |req, res|
  set_cors_headers(res)
  
  if req.request_method == 'OPTIONS'
    res.status = 200
    next
  end

  if req.request_method == 'POST'
    begin
      body = JSON.parse(req.body)
      uri = URI("#{TDX_URL}/auth/realms/TDXW/protocol/openid-connect/token")
      
      response = Net::HTTP.post_form(uri, 
        'grant_type' => 'client_credentials',
        'client_id' => body['client_id'],
        'client_secret' => body['client_secret']
      )
      
      res.status = response.code.to_i
      res.body = response.body
      res['Content-Type'] = 'application/json'
    rescue => e
      res.status = 500
      res.body = { error: e.message }.to_json
    end
  else
    res.status = 405
  end
end

# API Proxy
server.mount_proc '/api' do |req, res|
  set_cors_headers(res)

  if req.request_method == 'OPTIONS'
    res.status = 200
    next
  end

  # Extract path after /api
  path = req.path.sub(/^\/api/, '')
  query = req.query_string ? "?#{req.query_string}" : ""
  target_url = "#{TDX_URL}/api/basic/v2#{path}#{query}"
  
  begin
    uri = URI(target_url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    
    request = Net::HTTP::Get.new(uri.request_uri)
    request['Authorization'] = req['Authorization'] if req['Authorization']
    request['Accept'] = 'application/json'
    
    response = http.request(request)
    
    res.status = response.code.to_i
    res.body = response.body
    res['Content-Type'] = 'application/json'
  rescue => e
    res.status = 500
    res.body = { error: e.message }.to_json
  end
end

trap 'INT' do server.shutdown end

puts "\n🚀 Ruby Local Server running at http://localhost:#{PORT}"
puts "👉 Please open http://localhost:#{PORT} in your browser to view the app."

server.start
