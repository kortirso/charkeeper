# frozen_string_literal: true

module Cache
  class DaggerheartNames
    CACHE_KEY = 'daggerheart_names/0.4.4/v1'

    def fetch_list
      Rails.cache.fetch(CACHE_KEY, expires_in: 1.day) { load_initial_data }
    end

    def fetch_item(key:, id:)
      fetch_list.dig(key, id)
    end

    def push_item(key:, item:)
      list = fetch_list
      list[key][item.id] = new_item_value
      Rails.cache.write(CACHE_KEY, list, expires_in: 1.day)
    end

    def refresh_list
      Rails.cache.write(CACHE_KEY, load_initial_data, expires_in: 1.day)
    end

    private

    def load_initial_data
      {
        ancestries: ids_with_names(::Daggerheart::Homebrew::Race),
        communities: ids_with_names(::Daggerheart::Homebrew::Community),
        classes: ids_with_names(::Daggerheart::Homebrew::Speciality),
        subclasses: ids_with_names(::Daggerheart::Homebrew::Subclass)
      }
    end

    def ids_with_names(relation)
      name_json_defined = relation.method_defined?(:name_json)
      relation.all.each_with_object({}) do |item, acc|
        next acc[item.id] = { name: { en: item.name, ru: item.name } } unless name_json_defined

        acc[item.id] = { name: item.name_json.keys.blank? ? { en: item.name, ru: item.name } : item.name_json }
      end
    end

    def new_item_value(item)
      return { name: { en: item.name, ru: item.name } } if item.attributes.keys.exclude?('name_json')

      { name: item.name_json.keys.blank? ? { en: item.name, ru: item.name } : item.name_json }
    end
  end
end
