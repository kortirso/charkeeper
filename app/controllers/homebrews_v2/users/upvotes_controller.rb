# frozen_string_literal: true

module HomebrewsV2
  module Users
    class UpvotesController < Frontend::BaseController
      before_action :find_upvoteable, only: %i[update]
      before_action :find_upvote, only: %i[update]

      def update
        @upvote ? @upvote.destroy : current_user.upvotes.create(upvoteable: @upvoteable)
        only_head_response
      end

      private

      def find_upvoteable
        @upvoteable = relation.find(params.expect(:id))
      end

      def find_upvote
        @upvote = current_user.upvotes.find_by(upvoteable: @upvoteable)
      end

      def relation
        case params[:type]
        when 'Homebrew' then Homebrew
        when 'Homebrew::Book' then Homebrew::Book
        when 'Item' then Item
        when 'Feat' then Feat
        else Homebrew.none
        end
      end
    end
  end
end
