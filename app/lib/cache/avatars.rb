# frozen_string_literal: true

module Cache
  class Avatars
    include Rails.application.routes.url_helpers

    VERSION = '0.3.25'

    def fetch_list
      Rails.cache.fetch("avatars/#{VERSION}") { load_initial_data }
    end

    def fetch_item(id:)
      fetch_list[id]
    end

    def push_item(item:)
      Rails.cache.write("avatars/#{VERSION}", fetch_list.merge(item.record_id => rails_blob_url(item, host: 'charkeeper.org')))
    end

    def refresh_list
      Rails.cache.write("avatars/#{VERSION}", load_initial_data)
    end

    private

    def load_initial_data
      ActiveStorage::Attachment.where(name: 'avatar', record_type: 'Character')
        .includes(:blob)
        .each_with_object({}) do |item, acc|
          acc[item.record_id] = rails_blob_url(item, host: 'charkeeper.org', protocol: 'https')
        end
    end
  end
end
