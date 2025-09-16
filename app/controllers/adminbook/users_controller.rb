# frozen_string_literal: true

module Adminbook
  class UsersController < Adminbook::BaseController
    def index
      @pagy, @users = pagy(User.order(created_at: :desc), limit: 25)
    end
  end
end
