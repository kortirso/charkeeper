# frozen_string_literal: true

module Web
  module Users
    class ExternalController < Web::BaseController
      skip_before_action :authenticate

      def new; end
    end
  end
end
