# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddBookItemsCommand < BaseCommand
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
        existing_items_ids = input[:book].items.where(itemable_type: 'Daggerheart::Item').pluck(:itemable_id)
        items_ids =
          ::Item
            .where(type: 'Daggerheart::Item', user_id: input[:user].id)
            .where("name ->> 'en' = :name", name: input[:names])
            .where.not(id: existing_items_ids)
            .ids
        input[:attributes] = items_ids.map do |item_id|
          {
            homebrew_book_id: input[:book].id,
            itemable_type: 'Daggerheart::Item',
            itemable_id: item_id
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
