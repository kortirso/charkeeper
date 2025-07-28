# frozen_string_literal: true

module Adminbook
  module Users
    class PlatformsController < Adminbook::BaseController
      def index
        @platforms = User::Platform.order(created_at: :desc)
      end
    end
  end
end
