# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddBookItemsCommand < BaseCommand
      use_contract do
        config.messages.namespace = :homebrew_book

        params do
          required(:user).filled(type?: ::User)
          required(:book).filled(type?: Homebrew::Book)
          optional(:names).filled(:array).each(:string)
          optional(:ids).filled(:array).each(:string)
        end
      end

      private

      def do_prepare(input)
        input[:attributes] = ids(input).map do |id|
          {
            homebrew_book_id: input[:book].id,
            itemable_type: 'Daggerheart::Item',
            itemable_id: id
          }
        end
      end

      def do_persist(input)
        Homebrew::Book::Item.upsert_all(input[:attributes]) if input[:attributes].any?

        { result: :ok }
      end

      def ids(input)
        existing_items_ids = input[:book].items.where(itemable_type: 'Daggerheart::Item').pluck(:itemable_id)
        relation =
          ::Item
            .where(user_id: input[:user].id)
            .where.not(id: existing_items_ids)
        if input.key?(:ids)
          relation.where(id: input[:ids]).ids
        else
          relation.where("name ->> 'en' = :name", name: input[:names]).ids
        end
      end
    end
  end
end
