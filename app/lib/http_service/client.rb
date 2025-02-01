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
      response.body if response.success?
    end

    def post(path:, body: nil, headers: nil)
      raise StandardError, 'please stub request in test env' if Rails.env.test? && connection.adapter != 'Faraday::Adapter::Test'

      response = connection.post(path, body, headers)
      response.body if response.success?
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
