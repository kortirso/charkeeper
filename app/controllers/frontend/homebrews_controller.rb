# frozen_string_literal: true

module Frontend
  class HomebrewsController < Frontend::BaseController
    include Deps[
      feature_requirement: 'feature_requirement'
    ]

    before_action :find_homebrews
    before_action :add_homebrews

    def index
      render json: @homebrews, status: :ok
    end

    private

    def find_homebrews
      @homebrews = User::Homebrew.find_or_create_by(user: current_user).data
    end

    def add_homebrews
      if feature_requirement.call(current: params[:version], initial: '0.5.9')
        @homebrews['pathfinder2'] ||= {}
        @homebrews['pathfinder2']['backgrounds'] ||= {}
        @homebrews['pathfinder2']['backgrounds'].merge!(Config.data('pathfinder2', 'background_names'))
      end
    end
  end
end
