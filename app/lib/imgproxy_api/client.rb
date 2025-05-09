# frozen_string_literal: true

module ImgproxyApi
  class Client < HttpService::Client
    include Requests::ProcessImage

    BASE_URL = 'http://localhost:5300'

    option :url, default: proc { BASE_URL }
  end
end
