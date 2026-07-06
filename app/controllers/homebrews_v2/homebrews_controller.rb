# frozen_string_literal: true

module HomebrewsV2
  class HomebrewsController < HomebrewsV2::BaseController
    include SerializeRelation

    before_action :find_homebrews, only: %i[index]
    before_action :find_homebrew, only: %i[show]
    before_action :find_homebrews_for_batch_destroy, only: %i[batch_destroy]

    def index
      serialize_relation(
        @homebrews,
        ::HomebrewsV2::ListElementSerializer,
        :homebrews,
        {},
        { current_user_id: current_user.id }
      )
    end

    def show
      render json: { homebrews: @homebrew.to_homebrew_json }, status: status
    end

    def batch_destroy
      @homebrews.update_all(discarded_at: Time.current)
      only_head_response
    end

    private

    def find_homebrews
      @homebrews =
        ::Homebrew.where(user_id: current_user.id, type: params[:type])
          .or(
            ::Homebrew.where.not(user_id: current_user.id).where(public: true, type: params[:type])
          ).kept.order(created_at: :desc).includes(:homebrew_books)
    end

    def find_homebrew
      @homebrew = ::Homebrew.where(user_id: current_user.id, type: params[:type]).kept.find(params.expect(:id)) # rubocop: disable Rails/StrongParametersExpect
    end

    def find_homebrews_for_batch_destroy
      @homebrews = ::Homebrew.where(user_id: current_user.id, type: params[:type], id: params[:ids]).kept
    end
  end
end
