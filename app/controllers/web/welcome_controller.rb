# frozen_string_literal: true

module Web
  class WelcomeController < Web::BaseController
    include Deps[monitoring: 'monitoring.client']

    rate_limit to: 20, within: 1.minute, by: -> { request.ip }, name: 'welcome-short-term', except: :too_many_requests

    skip_before_action :authenticate

    def index; end

    def privacy; end

    def bot_commands; end

    def tips; end

    def changelogs; end

    def too_many_requests
      monitoring_too_many_requests
    end

    def close_cookie_banner
      cookies[:charkeeper_cookie_banner] = {
        value: 'clicked',
        domain: current_domain,
        expires: 1.year.from_now
      }.compact
      redirect_to root_path
    end

    private

    def monitoring_too_many_requests
      monitoring.notify(
        exception: Monitoring::TooManyRequestsError.new('Too many requests redirect'),
        metadata: {},
        severity: :info
      )
    end
  end
end
