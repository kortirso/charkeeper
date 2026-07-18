# frozen_string_literal: true

module Web
  class HomebrewsController < Web::BaseController
    include Authkeeper::ApplicationHelper

    rate_limit to: 10, within: 1.minute, by: -> { request.ip }, name: 'homebrews', only: :show

    layout 'homebrews_app'

    def show
      @access_token = cookies[Authkeeper.configuration.access_token_name]
    end
  end
end
