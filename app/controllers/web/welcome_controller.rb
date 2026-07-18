# frozen_string_literal: true

module Web
  class WelcomeController < Web::BaseController
    rate_limit to: 10, within: 1.minute, by: -> { request.ip }, name: 'welcome-short-term', except: :too_many_requests

    skip_before_action :authenticate

    def index; end

    def privacy; end

    def bot_commands; end

    def tips; end

    def changelogs; end

    def too_many_requests; end
  end
end
