# frozen_string_literal: true

module Web
  class WelcomeController < ApplicationController
    skip_before_action :authenticate

    def index; end
  end
end
