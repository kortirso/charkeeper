# frozen_string_literal: true

module HomebrewContext
  module Daggerheart
    class AddBookSubclassesCommand < BaseCommand
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
        existing_subclasses_ids = input[:book].items.where(itemable_type: 'Daggerheart::Homebrew::Subclass').pluck(:itemable_id)
        subclasses_ids =
          Homebrew::Subclass
            .where(type: 'Daggerheart::Homebrew::Subclass', user_id: input[:user].id, name: input[:names])
            .where.not(id: existing_subclasses_ids)
            .ids
        input[:attributes] = subclasses_ids.map do |race_id|
          {
            homebrew_book_id: input[:book].id,
            itemable_type: 'Daggerheart::Homebrew::Subclass',
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
