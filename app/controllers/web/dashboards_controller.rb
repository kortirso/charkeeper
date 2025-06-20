# frozen_string_literal: true

module Web
  class DashboardsController < Web::BaseController
    layout 'charkeeper_app'

    def show
      @access_token = cookies[Authkeeper.configuration.access_token_name]
    end
  end
end
