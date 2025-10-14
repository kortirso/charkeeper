# frozen_string_literal: true

require 'dry/initializer'

module HttpService
  class Client
    extend Dry::Initializer[undefined: false]

    option :url
    option :connection, default: proc { build_connection }

    def get(path:, params: nil, headers: nil)
      raise StandardError, 'please stub request in test env' if Rails.env.test? && connection.adapter != 'Faraday::Adapter::Test'

      response = connection.get(path, params, headers)
      {
        success: response.success?,
        body: response.body
      }
    end

    # rubocop: disable Metrics/AbcSize
    def post(path:, body: {}, params: {}, headers: {})
      raise StandardError, 'please stub request in test env' if Rails.env.test? && connection.adapter != 'Faraday::Adapter::Test'

      response = connection.post(path) do |request|
        params.each do |param, value|
          request.params[param] = value
        end
        headers.each do |header, value|
          request.headers[header] = value
        end
        request.body = body.to_json
      end
      response.body if response.success?
    end
    # rubocop: enable Metrics/AbcSize

    def delete(path:, params: nil, headers: nil)
      raise StandardError, 'please stub request in test env' if Rails.env.test? && connection.adapter != 'Faraday::Adapter::Test'

      response = connection.delete(path, params, headers)
      {
        success: response.success?,
        body: response.body
      }
    end

    private

    def build_connection
      Faraday.new(@url) do |conn|
        conn.request :url_encoded
        conn.response :json, content_type: /\bjson$/
        conn.adapter Faraday.default_adapter
      end
    end
  end
end
