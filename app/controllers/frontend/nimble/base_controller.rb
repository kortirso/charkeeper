# frozen_string_literal: true

module Frontend
  module Nimble
    class BaseController < Frontend::BaseController
      private

      def set_current_provider
        @current_provider = 'nimble'
      end
    end
  end
end
