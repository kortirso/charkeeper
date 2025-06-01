# frozen_string_literal: true

module Web
  class WelcomeController < Web::BaseController
    skip_before_action :authenticate

    def index; end
  end
end
