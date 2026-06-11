# frozen_string_literal: true

module HomebrewsV2
  class ListController < HomebrewsV2::BaseController
    include SerializeRelation

    before_action :find_homebrews, only: %i[index]

    def index
      serialize_relation(
        @homebrews,
        ::HomebrewsV2::ListElementSerializer,
        :homebrews,
        {},
        { current_user_id: current_user.id }
      )
    end

    private

    def find_homebrews
      @homebrews =
        ::Homebrew.where(user_id: current_user.id, type: params[:type])
          .or(
            ::Homebrew.where.not(user_id: current_user.id).where(public: true, type: params[:type])
          ).kept.order(created_at: :desc)
    end
  end
end
