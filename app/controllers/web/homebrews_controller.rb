# frozen_string_literal: true

module Web
  class HomebrewsController < Web::BaseController
    include Authkeeper::ApplicationHelper

    layout 'homebrews_app'

    def show
      @access_token = cookies[Authkeeper.configuration.access_token_name]
    end
  end
end
