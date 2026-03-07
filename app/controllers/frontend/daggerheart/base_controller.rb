# frozen_string_literal: true

module Frontend
  module Daggerheart
    class BaseController < Frontend::BaseController
      before_action :set_current_provider
      before_action :set_locale

      private

      def set_current_provider
        @current_provider = 'daggerheart'
      end
    end
  end
end
