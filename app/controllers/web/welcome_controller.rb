# frozen_string_literal: true

module Web
  class WelcomeController < Web::BaseController
    skip_before_action :authenticate

    def index; end

    def privacy; end

    def bot_commands; end

    def tips; end
  end
end
