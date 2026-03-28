# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Books
      class AddBackgroundsCommand < BaseCommand
        use_contract do
          config.messages.namespace = :homebrew_book

          params do
            required(:user).filled(type?: ::User)
            required(:book).filled(type?: Homebrew::Book)
            optional(:ids).filled(:array).each(:string)
          end
        end

        private

        def do_prepare(input)
          input[:attributes] = ids(input).map do |id|
            {
              homebrew_book_id: input[:book].id,
              itemable_type: 'Dnd2024::Homebrew::Background',
              itemable_id: id
            }
          end
        end

        def do_persist(input)
          Homebrew::Book::Item.upsert_all(input[:attributes]) if input[:attributes].any?

          { result: :ok }
        end

        def ids(input)
          existing_subclasses_ids = input[:book].items.where(itemable_type: 'Dnd2024::Homebrew::Background').pluck(:itemable_id)
          Dnd2024::Homebrew::Background
            .where(user_id: input[:user].id)
            .where.not(id: existing_subclasses_ids)
            .where(id: input[:ids])
            .ids
        end
      end
    end
  end
end
