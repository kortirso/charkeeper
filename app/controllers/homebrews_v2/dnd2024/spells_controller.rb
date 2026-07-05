# frozen_string_literal: true

module HomebrewsV2
  module Dnd2024
    class SpellsController < HomebrewsV2::FeatsController
      private

      def serializer = ::HomebrewsV2::Dnd2024::SpellSerializer
      def class_name = ::Dnd2024::Feat

      def copy_command
        HomebrewsV2Context::Import::Dnd2024::Spells::CopyCommand.new.call({
          spell: @feat, user: current_user
        })
      end

      def feats
        class_name.where(user_id: current_user.id).or(class_name.where(public: true))
          .where(origin: 'spell')
          .includes(:homebrew_books)
      end

      def order_options
        { key: %w[title] }
      end
    end
  end
end
