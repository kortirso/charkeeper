# frozen_string_literal: true

module HomebrewsV2Context
  module Books
    module Items
      class UpsertCommand < BaseCommand
        use_contract do
          Types = Dry::Types['strict.string'].enum(
            'Daggerheart::Homebrews::Transformation', 'Daggerheart::Homebrews::Ancestry', 'Daggerheart::Homebrews::Community',
            'Daggerheart::Homebrews::Speciality'
          )

          params do
            required(:user).filled(type?: ::User)
            required(:book).filled(type?: Homebrew::Book)
            required(:ids).filled(:array).each(:string)
            required(:itemable_type).filled(:string)
          end
        end

        private

        def do_prepare(input)
          input[:attributes] = ids(input).map do |id|
            {
              homebrew_book_id: input[:book].id,
              itemable_type: input[:itemable_type],
              itemable_id: id
            }
          end
        end

        def do_persist(input)
          Homebrew::Book::Item.upsert_all(input[:attributes]) if input[:attributes].any?

          { result: :ok }
        end

        def ids(input)
          existing_ids = input[:book].items.where(itemable_type: input[:itemable_type]).pluck(:itemable_id)
          input[:itemable_type].constantize
            .where(user_id: input[:user].id)
            .where.not(id: existing_ids)
            .where(id: input[:ids]).ids
        end
      end
    end
  end
end
