# frozen_string_literal: true

module Web
  module Users
    class RecoveryController < Web::BaseController
      skip_before_action :authenticate

      def new; end
    end
  end
end
