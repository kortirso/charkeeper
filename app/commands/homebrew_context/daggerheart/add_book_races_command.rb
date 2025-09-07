# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddBookRacesCommand < BaseCommand
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
        existing_race_ids = input[:book].items.where(itemable_type: 'Daggerheart::Homebrew::Race').pluck(:itemable_id)
        race_ids =
          Homebrew::Race
            .where(type: 'Daggerheart::Homebrew::Race', user_id: input[:user].id, name: input[:names])
            .where.not(id: existing_race_ids)
            .ids
        input[:attributes] = race_ids.map do |race_id|
          {
            homebrew_book_id: input[:book].id,
            itemable_type: 'Daggerheart::Homebrew::Race',
            itemable_id: race_id
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
