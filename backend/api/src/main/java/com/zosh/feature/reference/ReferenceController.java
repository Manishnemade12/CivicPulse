package com.zosh.feature.reference;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zosh.db.repo.AreaRepository;
import com.zosh.db.repo.ComplaintCategoryRepository;

@RestController
public class ReferenceController {

	private final AreaRepository areaRepository;
	private final ComplaintCategoryRepository complaintCategoryRepository;

	public ReferenceController(AreaRepository areaRepository, ComplaintCategoryRepository complaintCategoryRepository) {
		this.areaRepository = areaRepository;
		this.complaintCategoryRepository = complaintCategoryRepository;
	}

	public record AreaDto(UUID id, String city, String zone, String ward) {}

	@GetMapping("/api/areas")
	public List<AreaDto> listAreas() {
		return areaRepository.findAll(Sort.by("city").ascending().and(Sort.by("zone").ascending()).and(Sort.by("ward").ascending())).stream()
				.map(a -> new AreaDto(a.getId(), a.getCity(), a.getZone(), a.getWard()))
				.toList();
	}

	public record ComplaintCategoryDto(UUID id, String name) {}

	@GetMapping("/api/complaint-categories")
	public List<ComplaintCategoryDto> listCategories() {
		return complaintCategoryRepository.findAll(Sort.by("name").ascending()).stream()
				.map(c -> new ComplaintCategoryDto(c.getId(), c.getName()))
				.toList();
	}
}
