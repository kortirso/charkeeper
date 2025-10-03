# frozen_string_literal: true

module Frontend
  class HomebrewsController < Frontend::BaseController
    def index
      render json: User::Homebrew.find_or_create_by(user: current_user).data, status: :ok
    end
  end
end
