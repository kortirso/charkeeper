# frozen_string_literal: true

module Adminbook
  class UsersController < Adminbook::BaseController
    def index
      @users = User.order(created_at: :desc)
    end
  end
end
