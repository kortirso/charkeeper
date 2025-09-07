# frozen_string_literal: true

module Frontend
  module Homebrews
    class BooksController < Frontend::BaseController
      include SerializeRelation

      def index
        serialize_relation(books, serializer, :books)
      end

      private

      def books
        Homebrew::Book.where(provider: params[:provider], user_id: current_user.id).includes(:items)
      end

      def serializer
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::BookSerializer
        end
      end
    end
  end
end
