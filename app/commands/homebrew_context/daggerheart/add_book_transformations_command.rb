# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddBookTransformationsCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_book

        params do
          required(:user).filled(type?: ::User)
          required(:book).filled(type?: Homebrew::Book)
          required(:names).filled(:array).each(:string)
        end
      end

      private

      def do_prepare(input)
        existing_transformation_ids =
          input[:book].items.where(itemable_type: 'Daggerheart::Homebrew::Transformation').pluck(:itemable_id)
        transformation_ids =
          ::Daggerheart::Homebrew::Transformation
            .where(user_id: input[:user].id, name: input[:names])
            .where.not(id: existing_transformation_ids)
            .ids
        input[:attributes] = transformation_ids.map do |transformation_id|
          {
            homebrew_book_id: input[:book].id,
            itemable_type: 'Daggerheart::Homebrew::Transformation',
            itemable_id: transformation_id
          }
        end
      end

      def do_persist(input)
        Homebrew::Book::Item.upsert_all(input[:attributes]) if input[:attributes].any?

        { result: :ok }
      end
    end
  end
end
