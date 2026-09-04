# frozen_string_literal: true

module Cache
  class CosmereNames
    CACHE_KEY = 'nimble_names/0.5.10'

    def fetch_list
      Rails.cache.fetch(CACHE_KEY, expires_in: 1.day) { load_initial_data }
    end

    def fetch_item(key:, id:)
      fetch_list.dig(key, id)
    end

    def push_item(key:, item:)
      list = fetch_list
      list[key][item.id] = new_item_value(item)
      Rails.cache.write(CACHE_KEY, list, expires_in: 1.day)
    end

    def refresh_list
      Rails.cache.write(CACHE_KEY, load_initial_data, expires_in: 1.day)
    end

    private

    def load_initial_data
      {
        settings: ids_with_names(::Cosmere::Homebrews::Setting),
        cultures: ids_with_names(::Cosmere::Homebrews::Culture),
        ancestries: ids_with_names(::Cosmere::Homebrews::Ancestry),
        specializations: ids_with_names(::Cosmere::Homebrews::Specialization)
      }
    end

    def ids_with_names(relation)
      relation.all.each_with_object({}) do |item, acc|
        acc[item.id] = { name: item.title }
      end
    end

    def new_item_value(item)
      { name: item.title }
    end
  end
end
