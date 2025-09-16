# frozen_string_literal: true

module Adminbook
  module Users
    class PlatformsController < Adminbook::BaseController
      def index
        @pagy, @platforms = pagy(User::Platform.order(created_at: :desc), limit: 25)
      end
    end
  end
end
