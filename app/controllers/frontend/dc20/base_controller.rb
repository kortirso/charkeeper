# frozen_string_literal: true

module Frontend
  module Dc20
    class BaseController < Frontend::BaseController
      private

      def set_current_provider
        @current_provider = 'dc20'
      end
    end
  end
end
