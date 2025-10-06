# frozen_string_literal: true

module HomebrewsContext
  class FindAvailableService
    def call(user_id:)
      {
        daggerheart: {
          races: daggerheart_heritages(user_id),
          communities: daggerheart_communities(user_id),
          transformations: daggerheart_transformations(user_id),
          classes: daggerheart_classes(user_id),
          subclasses: daggerheart_subclasses(user_id)
        },
        dnd2024: {
          races: dnd2024_races(user_id)
        }
      }
    end

    private

    def dnd2024_races(user_id)
      relation = ::Dnd2024::Homebrew::Race
      relation.where(user_id: user_id)
        .or(
          relation.where(
            id: available_books_data(user_id)['Dnd2024::Homebrew::Race'] || available_books_data(user_id)['Homebrew::Race']
          )
        )
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name }, legacies: {}, sizes: item.data.size }
        end
    end

    def daggerheart_heritages(user_id)
      relation = ::Daggerheart::Homebrew::Race
      relation.where(user_id: user_id)
        .or(
          relation.where(
            id: available_books_data(user_id)['Daggerheart::Homebrew::Race'] || available_books_data(user_id)['Homebrew::Race']
          )
        )
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name } }
        end
    end

    def daggerheart_communities(user_id)
      relation = ::Daggerheart::Homebrew::Community
      relation.where(user_id: user_id)
        .or(
          relation.where(
            id: available_books_data(user_id)['Daggerheart::Homebrew::Community'] || available_books_data(user_id)['Homebrew::Community']
          )
        )
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name } }
        end
    end

    def daggerheart_transformations(user_id)
      relation = ::Daggerheart::Homebrew::Transformation
      relation.where(user_id: user_id)
        .or(
          relation.where(
            id: available_books_data(user_id)['Daggerheart::Homebrew::Race']
          )
        )
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name } }
        end
    end

    def daggerheart_classes(user_id)
      ::Daggerheart::Homebrew::Speciality.where(user_id: user_id).each_with_object({}) do |item, acc|
        acc[item.id] = { name: { en: item.name, ru: item.name }, domains: item.data.domains }
      end
    end

    def daggerheart_subclasses(user_id)
      relation = ::Daggerheart::Homebrew::Subclass
      relation.where(user_id: user_id)
        .or(
          relation.where(
            id: available_books_data(user_id)['Daggerheart::Homebrew::Subclass'] || available_books_data(user_id)['Homebrew::Subclass']
          )
        )
        .each_with_object({}) do |item, acc|
          acc[item.class_name] ||= {}
          acc[item.class_name][item.id] = { name: { en: item.name, ru: item.name }, spellcast: item.data.spellcast }
        end
    end

    def available_books_data(user_id)
      @available_books_data ||=
        ::Homebrew::Book::Item
          .where(homebrew_book_id: ::User::Book.where(user_id: user_id).select(:homebrew_book_id))
          .group_by(&:itemable_type)
          .transform_values { |item| item.pluck(:itemable_id) }
    end
  end
end
