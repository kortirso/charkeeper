# frozen_string_literal: true

module Web
  class PlatformsController < Web::BaseController
    rate_limit to: 20, within: 1.minute, by: -> { request.ip }, name: 'platform-short-term'

    skip_before_action :authenticate

    def pathfinder2; end

    def cosmere; end

    def nimble; end
  end
end
