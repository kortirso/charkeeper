# frozen_string_literal: true

module HomebrewsContext
  class FindAvailableService
    def call(user_id:)
      {
        daggerheart: {
          races: races_with_features(user_id).to_h,
          communities: daggerheart_communities(user_id),
          transformations: daggerheart_transformations(user_id),
          domains: daggerheart_domains(user_id),
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

    def races_with_features(...)
      daggerheart_heritages(...).map do |key, values|
        [
          key,
          values.merge(
            features: daggerheart_heritage_features(...)[key] || []
          )
        ]
      end
    end

    def daggerheart_heritages(user_id)
      return @daggerheart_heritages if defined?(@daggerheart_heritages)

      relation = ::Daggerheart::Homebrew::Race
      @daggerheart_heritages =
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

    def daggerheart_heritage_features(...)
      @daggerheart_heritage_features ||=
        ::Daggerheart::Feat
          .where(origin: 0)
          .where(origin_value: daggerheart_heritages(...).keys)
          .order(created_at: :asc)
          .select(:id, :title, :origin_value)
          .each_with_object({}) do |item, acc|
            acc[item.origin_value] ||= []
            acc[item.origin_value].push({ slug: item.id, name: item.title })
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
            id: available_books_data(user_id)['Daggerheart::Homebrew::Transformation']
          )
        )
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: item.name_json.keys.blank? ? { en: item.name, ru: item.name } : item.name_json }
        end
    end

    def daggerheart_domains(user_id)
      relation = ::Daggerheart::Homebrew::Domain
      relation.where(user_id: user_id)
        .or(
          relation.where(
            id: available_books_data(user_id)['Daggerheart::Homebrew::Domain']
          )
        )
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name } }
        end
    end

    # rubocop: disable Rails/PluckInWhere
    def daggerheart_classes(user_id)
      relation = ::Daggerheart::Homebrew::Speciality
      relation.where(user_id: user_id)
        .or(
          relation.where(
            id: ::Daggerheart::Homebrew::Subclass.where(id: available_books_data(user_id)['Daggerheart::Homebrew::Subclass']).pluck(:class_name)
          )
        )
        .each_with_object({}) do |item, acc|
          acc[item.id] = { name: { en: item.name, ru: item.name }, domains: item.data.domains }
        end
    end
    # rubocop: enable Rails/PluckInWhere

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
